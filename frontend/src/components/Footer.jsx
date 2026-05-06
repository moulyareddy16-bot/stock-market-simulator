function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#020617] border-t border-slate-800 py-4 text-center text-slate-400">
      © {new Date().getFullYear()} StockSim. All rights reserved.
    </footer>
  );
}

export default Footer;