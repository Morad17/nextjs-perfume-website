import Link from "next/link";
import "./navbar.scss";
export default function Navbar() {
  return (
    <div className="navbar">
      <div className="logo"></div>
      <ul className="nav-group">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/products">Products</Link>
        </li>
        <li>
          <Link href="/">Shop</Link>
        </li>
        <li>
          <Link href="/">Company</Link>
        </li>
      </ul>
    </div>
  );
}
