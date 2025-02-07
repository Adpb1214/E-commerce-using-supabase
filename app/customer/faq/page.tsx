"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "react-toastify"

type Query = {
  id: string
  question: string
  answer: string | null
  status: "pending" | "answered"
  product_id: string | null
}

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment gateway.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Domestic shipping typically takes 3-5 business days. International shipping can take 7-14 business days depending on the destination. Express shipping options are available at checkout.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all unused items in their original packaging. Simply initiate a return through your account dashboard and we'll provide a prepaid shipping label.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can calculate shipping costs at checkout.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order through your account dashboard.",
  },
  {
    question: "Are my payment details secure?",
    answer:
      "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers.",
  },
]

const UserQueries = () => {
  const supabase = createClientComponentClient()
  const [queries, setQueries] = useState<Query[]>([])
  const [question, setQuestion] = useState("")
  const [productId, setProductId] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) return
      setUserId(data.user.id)
    }

    fetchUser()
  }, [supabase])

  useEffect(() => {
    if (!userId) return

    const fetchQueries = async () => {
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false })

      if (!error) setQueries(data || [])
    }

    fetchQueries()
  }, [userId, supabase])

  const handleSubmit = async () => {
    if (!question.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from("queries")
      .insert([{ user_id: userId, product_id: productId || null, question, status: "pending", answer: null }])

    if (!error) {
      setQueries([
        {
          id: Math.random().toString(),
          question,
          answer: null,
          status: "pending",
          product_id: productId || null,
        },
        ...queries,
      ])
      setQuestion("")
      setProductId("")
      toast.success("question raised successfully")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-[2fr,1fr] gap-6">
          {/* FAQ Section */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-lg shadow-sm border px-4"
                >
                  <AccordionTrigger className="text-left font-medium py-4">{faq.question}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* User's Past Queries */}
            {queries.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Your Previous Questions</h2>
                <div className="space-y-4">
                  {queries.map((query) => (
                    <Card key={query.id} className="bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-medium">{query.question}</CardTitle>
                          <Badge variant={query.status === "answered" ? "default" : "secondary"}>
                            {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {query.product_id && (
                          <p className="text-sm text-gray-500 mb-2">Product ID: {query.product_id}</p>
                        )}
                        {query.answer && <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{query.answer}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ask a Question Form */}
          <div className="md:sticky md:top-6 h-fit">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Don't find your answer?</CardTitle>
                <p className="text-sm text-gray-500">
                  Ask for support. Our team will respond to your query as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Product ID (optional)"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
                <Textarea
                  placeholder="Your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserQueries

