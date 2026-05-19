"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MenuItemFeedbacksModal } from "@/features/menu/components/MenuItemFeedbacksModal";
import { FoodCategory } from "@/features/menu/config/menu.types";
import {
  useDeleteMenuItem,
  useMyMenu,
} from "@/features/menu/data-access/menu.queries";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import { motion } from "framer-motion";
import {
  Edit2,
  Filter,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  UtensilsCrossed
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const categories: FoodCategory[] = [
  "BEVERAGES",
  "PASTRIES",
  "SNACKS",
  "MEALS",
  "DESSERTS",
];

export default function ManagerMenuPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: menuItems, isLoading } = useMyMenu();
  const { mutateAsync: deleteItem } = useDeleteMenuItem();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Feedback Viewer states
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [averageRating, setAverageRating] = useState(5.0);

  const filteredItems = menuItems?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("manager.menu.toast_deleted"));
        setDeleteTarget(null);
      },
      onError: () => setDeleteTarget(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
            {t("manager.menu.title")}
          </h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            {t("manager.menu.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => router.push('/manager/menu/create')}
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t("manager.menu.add")}
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("manager.menu.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-11 w-11 border-secondary/20"
              >
                <Filter size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group relative rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 bg-white overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/10">
                    <div className="relative w-full h-56 bg-secondary/5 overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                          <ImageIcon className="h-12 w-12 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {t("manager.menu.no_image") || "NO IMAGE"}
                          </span>
                        </div>
                      )}

                      {/* Glass Overlay Badges */}
                      <div className="absolute top-5 left-5">
                        <Badge className="rounded-2xl bg-white/70 backdrop-blur-md text-primary border-none px-4 py-1.5 shadow-xl shadow-black/5 text-[10px] font-black uppercase tracking-widest">
                          {t(CATEGORY_MAP[item.category]) || item.category}
                        </Badge>
                      </div>

                      {/* Action Buttons Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => router.push(`/manager/menu/${item.menuItemId}/edit`)}
                          className="h-12 w-12 rounded-2xl bg-white text-primary hover:bg-primary hover:text-white shadow-2xl transition-all duration-300 scale-90 group-hover:scale-100"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleDelete(item.menuItemId, item.name)}
                          className="h-12 w-12 rounded-2xl bg-white text-red-600 hover:bg-red-600 hover:text-white shadow-2xl transition-all duration-300 scale-90 group-hover:scale-100"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-7 space-y-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-xl text-primary leading-tight line-clamp-1 flex-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => {
                              setSelectedMenuItemId(item.menuItemId);
                              setSelectedItemName(item.name);
                              setAverageRating(item.rating || 5.0);
                              setIsReviewsOpen(true);
                            }}
                            className="flex items-center gap-1 shrink-0 bg-amber-400/10 hover:bg-amber-400/20 active:scale-95 transition-all text-amber-600 rounded-full px-2.5 py-1 text-xs font-bold cursor-pointer"
                          >
                            <Star
                              size={12}
                              className="fill-amber-500 text-amber-500"
                            />
                            <span>
                              {item.rating ? item.rating.toFixed(1) : "5.0"}
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed min-h-[2.5rem]">
                          {item.description || t("manager.menu.no_desc")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-secondary/10">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {t("manager.menu.price")}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-primary text-xl">
                              {item.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-primary/60 uppercase">
                              VND
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {t("manager.menu.remaining")}
                          </span>
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                item.remaining > 10
                                  ? "bg-emerald-500"
                                  : "bg-amber-500",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-black",
                                item.remaining > 10
                                  ? "text-emerald-600"
                                  : "text-amber-600",
                              )}
                            >
                              {item.remaining}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 rounded-full bg-secondary/5">
                <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">
                  {t("manager.menu.empty")}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  {t("manager.menu.empty_desc")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Feedbacks details modal */}
      <MenuItemFeedbacksModal
        open={isReviewsOpen}
        onOpenChange={setIsReviewsOpen}
        menuItemId={selectedMenuItemId}
        itemName={selectedItemName}
        averageRating={averageRating}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("manager.menu.delete_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.delete_confirm_cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("common.delete_confirm_action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
