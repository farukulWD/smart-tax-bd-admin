import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export const OrderSummaryCard = ({
  title,
  value,
  icon: Icon,
}: OrderSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <Icon className="h-5 w-5 text-primary" />
      </CardContent>
    </Card>
  );
};
