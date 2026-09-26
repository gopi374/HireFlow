const BASE_URL = "http://localhost:5000/api/v1";

export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

export async function loginUser(credentials) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function getLoginUser(credentials){
  const res = await fetch(`${BASE_URL}/auth/me`,{
    method : "GET",
    headers : {
      "Content-Type":"application/json",
    },
    body:JSON.stringify(credentials)
  });

  const data = await res.json();
  if(!res.ok || !data.success){
    throw new Error(data.message || "Profile Fetch Faild")
  }
  return data;
}