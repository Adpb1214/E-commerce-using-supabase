"use client"

import { supabase } from "@/lib/supabaseClient"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, UserPlus, Loader } from "lucide-react"

type User = {
  id: string
  name: string
  role: string
  phone_number?: string
  photo_url?: string
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("profiles").select("id, name, phone_number, photo_url, role")

    if (error) {
      console.error("Error fetching users:", error.message)
      setError("Failed to fetch users.")
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, []) //Fixed: Added empty dependency array to useEffect

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[100vh]">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">User Directory</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user, index) => (
          user.role==="client" &&
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUserClick(user.id)}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl"
          >
            <div className="p-4">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                {user.photo_url ? (
                  <img
                    src={user.photo_url || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">{user.name}</h2>
              <p className="text-sm text-center text-gray-600 mb-2">{user.role}</p>
              {user.phone_number && <p className="text-sm text-center text-gray-500">{user.phone_number}</p>}
            </div>
            <div className="bg-blue-500 p-2 flex justify-center items-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Users

