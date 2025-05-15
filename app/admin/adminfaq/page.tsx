"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react"; // For delete icon

type Query = {
  id: string;
  user_id: string;
  product_id: string | null;
  question: string;
  answer: string | null;
  status: "pending" | "answered";
};

const AdminQueries = () => {
  const supabase = createClientComponentClient();
  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      const { data, error } = await supabase
        .from("queries") // Ensure the table name is correct
        .select("*")
        .order("id", { ascending: false });

      if (!error) setQueries(data || []);
    };

    fetchQueries();
  }, [supabase]);

  const handleAnswerSubmit = async (queryId: string) => {
    if (!answers[queryId]?.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from("queries")
      .update({ answer: answers[queryId], status: "answered" })
      .eq("id", queryId);

    if (!error) {
      setQueries(
        queries.map((query) =>
          query.id === queryId ? { ...query, answer: answers[queryId], status: "answered" } : query
        )
      );
      setAnswers({ ...answers, [queryId]: "" });

    }

    setLoading(false);
  };

  const handleDeleteQuery = async (queryId: string) => {
    setDeleting(queryId);

    const { error } = await supabase.from("queries").delete().eq("id", queryId);

    if (!error) {
      setQueries(queries.filter((query) => query.id !== queryId));
    }

    setDeleting(null);
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Queries</h1>

      {queries.length > 0 ? (
        queries.map((query) => (
          <Card key={query.id} className="mb-4 relative">
            <CardHeader>
              <CardTitle className="text-lg">{query.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">User ID: {query.user_id}</p>
              <p className="text-sm text-gray-600">
                {query.product_id ? `Product ID: ${query.product_id}` : <span className="italic">General Query</span>}
              </p>
              <Badge variant={query.status === "answered" ? "success" : "warning"}>
                {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
              </Badge>

              {query.answer ? (
                <p className="mt-2 text-gray-800">Answer: {query.answer}</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Enter answer..."
                    value={answers[query.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [query.id]: e.target.value })}
                  />
                  <Button onClick={() => handleAnswerSubmit(query.id)} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              )}

              {/* Delete Button */}
              <Button
                variant="destructive"
                className="absolute top-4 right-4"
                onClick={() => handleDeleteQuery(query.id)}
                disabled={deleting === query.id}
              >
                {deleting === query.id ? "Deleting..." : <Trash2 size={16} />}
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No queries found.</p>
      )}
    </div>
  );
};

export default AdminQueries;
