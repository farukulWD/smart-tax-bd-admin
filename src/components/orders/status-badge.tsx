import { Badge } from "../ui/badge";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 font-bold">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1 font-bold"
        >
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">
          Cancelled
        </Badge>
      );

    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 font-bold">
          Processing
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 font-bold">
          Paid
        </Badge>
      );
    case "unpaid":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">
          Unpaid
        </Badge>
      );
    case "order_placed":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 font-bold">
          Order Placed
        </Badge>
      );
    case "order_cancelled":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">
          Order Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="px-3 py-1 font-bold">
          {status}
        </Badge>
      );
  }
};

export default StatusBadge;
