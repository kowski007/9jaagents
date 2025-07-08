import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AgentDetailModal from "../components/AgentDetailModal";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/queryClient";

export default function AgentDetailPage() {
  // useRoute returns [params: object | null | false]
  const [params] = useRoute<{ agentId: string }>("/agent/:agentId");
  const agentId = params && typeof params === 'object' ? (params as any).agentId : undefined;
  const [, setLocation] = useLocation();
  const [agent, setAgent] = useState(null);
  const [seller, setSeller] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/agents/" + agentId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/agents/${agentId}`);
      return res.json();
    },
    enabled: !!agentId,
  });

  useEffect(() => {
    if (data) {
      setAgent(data.agent);
      setSeller(data.seller);
    }
  }, [data]);

  if (isLoading) return <div className="flex justify-center items-center h-96">Loading...</div>;
  if (error || !agent) return <div className="flex justify-center items-center h-96">Agent not found.</div>;

  return (
    <div className="container mx-auto py-8">
      {agent && (
        <AgentDetailModal agent={agent} seller={seller || undefined} isOpen={true} onClose={() => setLocation("/marketplace")} />
      )}
    </div>
  );
}
