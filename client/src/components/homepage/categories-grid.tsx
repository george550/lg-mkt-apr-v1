import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BarChart2,
  ShoppingBag,
  MessageCircle,
  Sliders,
  Table,
  Layout,
  Mail,
  User,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

// Map for icon names to components
const IconMap: Record<string, React.ReactNode> = {
  LineChart: <BarChart2 className="h-5 w-5" />,
  ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  MessageCircle: <MessageCircle className="h-5 w-5" />,
  Sliders: <Sliders className="h-5 w-5" />,
  Table: <Table className="h-5 w-5" />,
  Layout: <Layout className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  User: <User className="h-5 w-5" />
};

export default function CategoriesGrid() {
  const {
    data: categories,
    isLoading,
    error
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section>
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 pb-2">
                  <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4 mb-3" />
                </CardContent>
                <CardFooter className="bg-muted/50 px-4 py-3 pt-0">
                  <Skeleton className="h-3 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="container py-8">
          <div className="text-center">
            <p className="text-destructive">Failed to load categories</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container py-8">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories && categories.map((category) => (
            <Link key={category.id} href={`/browse?category=${category.id}`}>
              <Card className="h-full hover:border-gray-400 transition-colors">
                <CardContent className="p-4 pb-2">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-muted">
                    {category.iconName && IconMap[category.iconName] ? (
                      IconMap[category.iconName]
                    ) : (
                      <Layout className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="text-base font-medium truncate">{category.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{category.description}</p>
                </CardContent>
                <CardFooter className="px-4 py-3 pt-0">
                  <span className="text-xs flex items-center">
                    {category.listingCount || 0} templates
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
