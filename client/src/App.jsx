import { useContext } from "react";
import { Navbar, Footer, Services, Transactions, Welcome } from "./components";
import { TransactionContext } from "./context/TransactionContext";

function App() {
  const {} = useContext(TransactionContext);

  return (
    <div className="min-hs-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  );
}

export default App;
