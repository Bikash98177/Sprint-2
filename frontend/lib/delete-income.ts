export const deleteIncome = async ({ incomeId }: { incomeId: number }) => {

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
  }

  const csrfToken = getCookie("csrftoken")

  const formData = new FormData()
  formData.append("id", incomeId.toString()) // 👈 Pass the ID of the income to delete

  try {
    const response = await fetch("http://localhost:8000/income/deleteIncome/", {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken || "",
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete income")
    }
    
    return true; // ✅ success

  } catch (err) {
    console.error("Delete failed:", err)
  }
}
