Cấu trúc thư mục khi thêm 1 feature mới, ví dụ tên feature là `vendor`:

```
frontend/
├── src/
│   ├── features/
│   │   ├── vendor/
│   │   │   ├── components/  // các component
│   │   │   │   ├── VendorCard.tsx
│   │   │   │   ├── VendorForm.tsx
│   │   │   │   └── ...
│   │   │   ├── data-access/ // các api, query
│   │   │   │   ├── vendor.api.ts
│   │   │   │   └── vendor.queries.ts
│   │   │   ├── config/ // các config
│   │   │   │   └── vendor.config.ts (bao gồm type và zod schema)
│   │   ├── auth/
│   │   ├── menu/
│   │   └── ...
│   ├── lib/
│   ├── shared/
│   └── ...
└── ...
```

Có thể tham khảo `auth` làm chuẩn.