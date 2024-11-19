import { useWorkflowStore } from '@/store/workflowStore';

export function useWorkflow() {
  const workflows = useWorkflowStore((state) => state.workflows);
  return { workflows };
}