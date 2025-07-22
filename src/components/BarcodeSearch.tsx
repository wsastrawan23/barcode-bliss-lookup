import { useState } from "react";
import { Search, Loader2, AlertCircle, Package, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PriceTier {
  qty: number;
  price: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  cogs: number;
  selling_price: number;
  selling_price_2?: number;
  stock: number;
  price_tiers?: PriceTier[];
}

interface ApiResponse {
  status: string;
  products: Product[];
}

export default function BarcodeSearch() {
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const searchProducts = async () => {
    if (!barcode.trim()) {
      toast({
        title: "Please enter a barcode",
        description: "Enter a product barcode to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setProducts([]);

    try {
      const response = await fetch(
        `https://hw.blicyber.web.id/admin/products/barcode?barcode=${encodeURIComponent(barcode.trim())}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        toast({
          title: "Products found",
          description: `Found ${data.products.length} product(s)`,
        });
      } else {
        setError("No products found for this barcode");
        toast({
          title: "No results",
          description: "No products found for this barcode",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchProducts();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Barcode Lookup</h1>
          <p className="text-muted-foreground">Search products by barcode</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter barcode (e.g., bir bintang)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={searchProducts} 
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Found {products.length} product(s)
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="animate-fade-in hover:shadow-lg transition-all duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Barcode:</span>
                        <span className="font-mono">{product.barcode}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">COGS:</span>
                        <span className="font-semibold">{formatPrice(product.cogs)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Selling Price:</span>
                        <span className="font-semibold text-primary">{formatPrice(product.selling_price)}</span>
                      </div>

                      {product.selling_price_2 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price 2:</span>
                          <span className="font-semibold">{formatPrice(product.selling_price_2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={`font-semibold ${product.stock === 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {product.stock} units
                        </span>
                      </div>
                    </div>

                    {/* Price Tiers */}
                    {product.price_tiers && product.price_tiers.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Price Tiers</span>
                        </div>
                        <div className="space-y-1">
                          {product.price_tiers.slice(0, 3).map((tier, tierIndex) => (
                            <div key={tierIndex} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{tier.qty}+ units:</span>
                              <span className="font-medium">{formatPrice(tier.price)}</span>
                            </div>
                          ))}
                          {product.price_tiers.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{product.price_tiers.length - 3} more tiers
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}