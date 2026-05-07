import { useParams }
from "react-router-dom";

function StockDetails() {

   // get stock symbol from URL
   const { stockSymbol } =
      useParams();


   return (

      <div className="min-h-screen bg-slate-900 p-10 text-white">

         <h1 className="text-4xl font-bold">

            {stockSymbol}

         </h1>


         <p className="mt-4 text-slate-400">

            Stock details page

         </p>

      </div>

   );

}

export default StockDetails;