import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherDto,
} from '../config/voucher.config'
import {
  CreateVoucherApi,
  DeleteVoucherApi,
  GetVoucherByIdApi,
  GetVouchersByVendorApi,
  UpdateVoucherApi,
} from './voucher.api'

export const voucherKeys = {
  all: ['vouchers'] as const,
  byVendor: (vendorId: string) => [...voucherKeys.all, 'vendor', vendorId] as const,
  detail: (id: string) => [...voucherKeys.all, 'detail', id] as const,
}

export const useVouchersByVendor = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: voucherKeys.byVendor(vendorId ?? ''),
    queryFn: () => GetVouchersByVendorApi(vendorId!),
    enabled: !!vendorId,
  })
}

export const useVoucherById = (id: string | undefined) => {
  return useQuery({
    queryKey: voucherKeys.detail(id ?? ''),
    queryFn: () => GetVoucherByIdApi(id!),
    enabled: !!id,
  })
}

export const useCreateVoucher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => CreateVoucherApi(data),
    onSuccess: (newVoucher: VoucherDto) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.byVendor(newVoucher.vendorId) })
    },
  })
}

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      UpdateVoucherApi(id, data),
    onSuccess: (updated: VoucherDto) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.byVendor(updated.vendorId) })
      queryClient.invalidateQueries({ queryKey: voucherKeys.detail(updated.voucherId) })
    },
  })
}

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, vendorId }: { id: string; vendorId: string }) =>
      DeleteVoucherApi(id).then(() => ({ vendorId })),
    onSuccess: ({ vendorId }: { vendorId: string }) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.byVendor(vendorId) })
    },
  })
}
