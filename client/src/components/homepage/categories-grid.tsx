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
  LineChart: <BarChart2 className="h-6 w-6" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6" />,
  MessageCircle: <MessageCircle className="h-6 w-6" />,
  Sliders: <Sliders className="h-6 w-6" />,
  Table: <Table className="h-6 w-6" />,
  Layout: <Layout className="h-6 w-6" />,
  Mail: <Mail className="h-6 w-6" />,
  User: <User className="h-6 w-6" />
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
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-2">
                  <Skeleton className="h-4 w-24" />
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
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">Failed to load categories</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories && categories.map((category) => (
            <Link key={category.id} href={`/browse?category=${category.id}`}>
              <Card className="group flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div 
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4`}
                    style={{ 
                      backgroundColor: category.color ? `${category.color}20` : 'var(--primary)',
                      color: category.color || 'var(--primary)'
                    }}
                  >
                    {category.iconName && IconMap[category.iconName] ? (
                      IconMap[category.iconName]
                    ) : (
                      <Layout className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
                <CardFooter 
                  className="px-6 py-2 bg-muted/50 group-hover:bg-opacity-70 transition-colors duration-200"
                  style={{ color: category.color || 'var(--primary)' }}
                >
                  <span className="text-sm font-medium flex items-center">
                    {category.listingCount || 0} templates
                    <ChevronRight className="ml-1 h-4 w-4" />
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
