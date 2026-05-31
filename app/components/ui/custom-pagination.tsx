import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface CustomPaginationProps {
  halamanSaatIni: number;
  setHalamanSaatIni: (page: number) => void;
  totalHalaman: number;
  itemPerHalaman: number;
  setItemPerHalaman: (items: number) => void;
}

export function CustomPagination({
  halamanSaatIni,
  setHalamanSaatIni,
  totalHalaman,
  itemPerHalaman,
  setItemPerHalaman,
}: CustomPaginationProps) {
  if (totalHalaman <= 0) return null;

  const renderPaginationItems = () => {
    const items = [];
    const batasTampil = 5;

    if (totalHalaman <= batasTampil) {
      for (let i = 1; i <= totalHalaman; i++) items.push(i);
    } else {
      if (halamanSaatIni <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalHalaman);
      } else if (halamanSaatIni >= totalHalaman - 2) {
        items.push(
          1,
          "ellipsis",
          totalHalaman - 3,
          totalHalaman - 2,
          totalHalaman - 1,
          totalHalaman,
        );
      } else {
        items.push(
          1,
          "ellipsis",
          halamanSaatIni - 1,
          halamanSaatIni,
          halamanSaatIni + 1,
          "ellipsis",
          totalHalaman,
        );
      }
    }

    return items.map((item, index) => {
      if (item === "ellipsis") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            isActive={halamanSaatIni === item}
            onClick={(e) => {
              e.preventDefault();
              setHalamanSaatIni(item as number);
            }}
            className={
              halamanSaatIni === item
                ? "rounded-xl"
                : "rounded-xl hover:bg-muted"
            }
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-1.5 rounded-full border shadow-sm">
        <span>Tampilkan</span>
        <Select
          value={itemPerHalaman.toString()}
          onValueChange={(val) => {
            setItemPerHalaman(Number(val));
            setHalamanSaatIni(1);
          }}
        >
          <SelectTrigger className="w-[70px] h-7 rounded-md border-0 bg-transparent shadow-none focus:ring-0 px-1 font-semibold text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>data</span>
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (halamanSaatIni > 1) setHalamanSaatIni(halamanSaatIni - 1);
              }}
              className={cn(
                "rounded-xl",
                halamanSaatIni === 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-muted",
              )}
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (halamanSaatIni < totalHalaman)
                  setHalamanSaatIni(halamanSaatIni + 1);
              }}
              className={cn(
                "rounded-xl",
                halamanSaatIni >= totalHalaman
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-muted",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
