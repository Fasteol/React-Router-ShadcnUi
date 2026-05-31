import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data?",
  description,
  itemName,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <AlertCircle className="w-5 h-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm mt-2">
            {description || (
              <>
                Tindakan ini permanen. Data{" "}
                <strong className="text-foreground">{itemName}</strong> akan
                dihapus dari sistem dan tidak dapat dikembalikan.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel
            onClick={onClose}
            className="rounded-xl w-full sm:w-auto mt-0"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md w-full sm:w-auto font-semibold"
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
