import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/services/api';

export type ReportReason = 'INAPPROPRIATE' | 'OFFENSIVE' | 'SPAM' | 'COPYRIGHT' | 'OTHER';

export const useReportStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { storyId: number; reason: ReportReason; message?: string }) =>
      api.reportStory(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hasReported', variables.storyId] });
    },
  });
};

export const useHasReportedStory = (storyId: number) => {
  return useQuery({
    queryKey: ['hasReported', storyId],
    queryFn: async () => {
      const res = await api.hasReportedStory(storyId);
      return res.hasReported;
    },
    enabled: !!storyId,
  });
};
