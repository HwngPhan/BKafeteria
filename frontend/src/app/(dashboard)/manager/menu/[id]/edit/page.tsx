"use client";

import { Button } from "@/components/ui/button";
import {
  MenuItemForm,
  MenuItemFormData,
} from "@/features/menu/components/MenuItemForm";
import {
  useMenuItemById,
  useUpdateMenuItem,
  useUpdateMenuItemImage,
} from "@/features/menu/data-access/menu.queries";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useLanguage } from "@/providers/LanguageProvider";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const { data: item, isLoading } = useMenuItemById(id);
  const { mutateAsync: updateItem, isPending } = useUpdateMenuItem();
  const { mutateAsync: updateItemImage, isPending: isUpdatingImagePending } =
    useUpdateMenuItemImage();
  const { uploadImage, isUploading: isUploadingImage } = useUploadImage();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">
          {t("manager.menu.item_not_found")}
        </h2>
        <p className="text-muted-foreground">
          {t("manager.menu.item_not_found_desc")}
        </p>
        <Button
          onClick={() => router.push("/manager/menu")}
          className="rounded-2xl"
        >
          {t("manager.menu.back_to_menu")}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: MenuItemFormData, file: File | null) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      remaining: parseInt(data.remaining),
    };

    try {
      await updateItem({
        id: item.menuItemId,
        data: file
          ? { ...formattedData, imageUrl: item.imageUrl }
          : formattedData,
      });

      if (file) {
        try {
          const url = await uploadImage(file);
          if (url) {
            await updateItemImage({
              id: item.menuItemId,
              data: { imageUrl: url },
            });
          }
          toast.success(t("manager.menu.toast_updated"));
        } catch {
          toast.error(t("manager.menu.toast_update_partial"));
        }
      } else {
        toast.success(t("manager.menu.toast_updated"));
      }

      if (data.imageUrl.startsWith("blob:")) URL.revokeObjectURL(data.imageUrl);
      router.push("/manager/menu");
    } catch {
      // mutation error handled by TanStack Query
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/manager/menu")}
          className="rounded-xl h-11 w-11"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t("manager.menu.edit_page_title")}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {t("manager.menu.edit_page_subtitle")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-secondary/5 overflow-hidden">
        <MenuItemForm
          initialData={item}
          isPending={isPending || isUpdatingImagePending}
          isUploadingImage={isUploadingImage}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/manager/menu")}
        />
      </div>
    </div>
  );
}
