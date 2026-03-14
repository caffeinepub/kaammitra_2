import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, Worker } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllJobs(
  categoryFilter?: string,
  locationFilter?: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ["jobs", categoryFilter, locationFilter],
    queryFn: async () => {
      if (!actor) return [];
      if (categoryFilter && categoryFilter !== "all") {
        return actor.getJobsByCategory(categoryFilter);
      }
      if (locationFilter && locationFilter.trim() !== "") {
        return actor.getJobsByLocation(locationFilter.trim());
      }
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useGetAllWorkers(
  categoryFilter?: string,
  locationFilter?: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Worker[]>({
    queryKey: ["workers", categoryFilter, locationFilter],
    queryFn: async () => {
      if (!actor) return [];
      if (categoryFilter && categoryFilter !== "all") {
        return actor.getWorkersByCategory(categoryFilter);
      }
      if (locationFilter && locationFilter.trim() !== "") {
        return actor.getWorkersByLocation(locationFilter.trim());
      }
      return actor.getAllWorkers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      category: string;
      location: string;
      description: string;
      payOffered: string;
      postedBy: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createJob(
        data.category,
        data.location,
        data.description,
        data.payOffered,
        data.postedBy,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useCreateJobApproved() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      category: string;
      location: string;
      description: string;
      payOffered: string;
      postedBy: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createJobApproved(
        data.category,
        data.location,
        data.description,
        data.payOffered,
        data.postedBy,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useCreateWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      experience: string;
      location: string;
      expectedSalary: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createWorker(
        data.name,
        data.experience,
        data.location,
        data.expectedSalary,
        data.category,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

export function useSubmitContact() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitContact(data.name, data.phone, data.message);
    },
  });
}
