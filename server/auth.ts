import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get callback URL based on environment
function getCallbackUrl() {
  // Use the exact URL from the GitHub OAuth application settings
  return 'https://workspace.g028.repl.co/api/auth/github/callback';
}

export function setupAuth(app: Express) {
  // Check for required environment variables
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn('GitHub OAuth credentials missing. GitHub authentication will not work.');
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "codecraft-marketplace-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax' // Protects against CSRF attacks
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy (username + password)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // GitHub OAuth strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const callbackUrl = getCallbackUrl();
    console.log('GitHub OAuth callback URL:', callbackUrl);
    
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: callbackUrl,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists by GitHub ID
            let user = await storage.getUserByGithubId(profile.id);
            
            if (!user) {
              // Check if user exists with same email
              const email = profile.emails && profile.emails[0]?.value;
              if (email) {
                user = await storage.getUserByEmail(email);
              }
              
              if (!user) {
                // Create new user
                const username = profile.username || `github_${profile.id}`;
                const insertUser: InsertUser = {
                  username: username,
                  email: email || `${username}@example.com`,
                  password: null, // No password for OAuth users
                  githubId: profile.id,
                  avatar: profile.photos?.[0]?.value || null,
                  isVerified: true, // GitHub-authenticated users are verified
                };
                
                user = await storage.createUser(insertUser);
              } else {
                // Update existing user with GitHub ID
                user = await storage.updateUser(user.id, {
                  githubId: profile.id,
                  avatar: profile.photos?.[0]?.value || user.avatar,
                });
              }
            } else {
              // Update user info from GitHub
              user = await storage.updateUser(user.id, {
                avatar: profile.photos?.[0]?.value || user.avatar,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Traditional username/password registration
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const emailExists = await storage.getUserByEmail(req.body.email);
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isVerified: false,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  // Traditional username/password login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // GitHub OAuth routes
  app.get("/api/auth/github", (req, res, next) => {
    // Add state parameter to track the auth request
    const state = req.query.mode === 'link' ? 'link-account' : '';
    passport.authenticate("github", { state })(req, res, next);
  });
  
  app.get(
    "/api/auth/github/callback",
    (req, res, next) => {
      // Log all parameters coming in
      console.log('GitHub callback received:', { 
        query: req.query,
        url: req.url,
        path: req.path,
        headers: req.headers
      });
      
      // Handle errors before passport processes the request
      if (req.query.error) {
        console.error('GitHub auth error:', req.query);
        return res.redirect(`/auth?error=github-auth-failed&reason=${req.query.error_description || 'Unknown error'}`);
      }
      
      // Continue with passport authentication
      passport.authenticate("github", { 
        failureRedirect: '/auth?error=github-auth-failed',
        failureMessage: true
      }, (err, user, info) => {
        // Log authentication results
        console.log('GitHub auth result:', { err, user: user ? 'User found' : 'No user', info });
        
        if (err) {
          console.error('GitHub auth error:', err);
          return res.redirect('/auth?error=github-auth-failed&reason=' + encodeURIComponent(err.message));
        }
        
        if (!user) {
          console.error('GitHub auth failed - no user:', info);
          return res.redirect('/auth?error=github-auth-failed&reason=Authentication failed');
        }
        
        // Login the user
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error after GitHub auth:', loginErr);
            return res.redirect('/auth?error=github-auth-failed&reason=' + encodeURIComponent(loginErr.message));
          }
          
          // Determine if this was a link request
          const isLinkRequest = req.query.state === 'link-account';
          
          // Update last login time
          storage.updateUser(user.id, { 
            lastLogin: new Date(),
            isVerified: true // Ensure GitHub users are always verified
          })
          .catch(err => console.error("Failed to update user data:", err));
          
          // Successful authentication, redirect appropriately
          console.log('GitHub auth successful, redirecting to:', isLinkRequest ? '/dashboard/settings' : '/dashboard/buyer');
          res.redirect(isLinkRequest ? '/dashboard/settings' : '/dashboard/buyer');
        });
      })(req, res, next);
    }
  );

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Auth check middleware for protected routes
  app.use("/api/protected", (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  });
}
