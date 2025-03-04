"use client"
import Image from "next/image";
import { useEffect , useState } from "react";
import { useRouter} from "next/navigation";
import axios from 'axios'
export default function Home() {


  const [userdetail,setUserDetail] = useState({})
  const [productname,setProductName] = useState('')
  const [productprice,setProductPrice] = useState(0)
  const [products,setProducts] = useState([])
  const [error,setError] = useState('')



      useEffect(()=>{
        axios
      .get("http://localhost:8000/user/getuserdetail", { withCredentials: true })
      .then((response) => {
        const user = response.data.user;
        console.log(user);
        setUserDetail(user);
        console.log(user._id);
        // Use the user ID to fetch products
        axios
          .get(`http://localhost:8000/product/getproduct/${user._id}`, {
            withCredentials: true,
          })
          .then((productResponse) => {
            console.log(productResponse.data); // Log the products data
            setProducts(productResponse.data); // Assuming the response has products array
          })
          .catch((productError) => {
            console.error("Error fetching products:", productError);
          });
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, []);
        
    
    
   
const handleSubmit = (e) => {
  e.preventDefault()
  try {
   axios.post('http://localhost:8000/product/addproduct' ,{productname,productprice} ,{withCredentials:true}).then((response)=>{
   
    window.location.href = '/'
   })
     
    
    
  } catch (error) {
    setError(error.message)
  }

}



  return (
  
  <div>
    Dashboard
    <h1>{userdetail?.name}</h1>
    <h3>Email:{userdetail?.email}</h3>
      {error && <p>{error}</p>}<br></br>
      My products:
      {products.length > 0 ? (
            products.map((product) => (
              <li key={product._id}>
                
                  {product.name}:{product.price}
                  
              
              </li>
            ))
          ) : (
            <p>No products available.</p>
          )}
      <br></br>
      Add product:
    <form onSubmit={handleSubmit}>
      <input 
      type = 'name'
      placeholder="product name"
      value={productname}
      onChange={(e) => setProductName(e.target.value)}
      /><br></br>
     
      <input 
      type = "number"
      placeholder="product price"
      value = {productprice}
      onChange={(e) => setProductPrice(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>   
    </div>
  

)

}
