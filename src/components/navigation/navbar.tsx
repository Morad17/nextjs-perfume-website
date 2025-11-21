import Link from "next/link";
import "./navbar.scss";
export default function Navbar() {
  return (
    <ul className="navbar">
      <li>
        <Link href="/">Company</Link>
      </li>{" "}
      <li>
        <Link href="/">Shop</Link>
      </li>
      <li>
        <Link href="/products">Products</Link>
      </li>
      <li>
        <Link href="/">Home</Link>
      </li>
      <div className="logo">PS</div>
    </ul>
  );
}
