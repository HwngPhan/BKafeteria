"use client";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [isChecking, setIsChecking] = useState(true);

//   useEffect(() => {
//     const authToken = localStorage.getItem("authToken");

//     if (authToken) {
//       router.replace("/dashboard");
//     } else {
//       setIsChecking(false); // cho phép render children
//     }
//   }, [router]);

//   if (isChecking) {
//     return (
//       <div className="flex items-center justify-center h-screen w-full">
//         {/* Spinner */}
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-black" />
//       </div>
//     );
//   }

  return <>{children}</>;
}
