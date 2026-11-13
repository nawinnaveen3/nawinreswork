import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <div className="brand">NAWIN'S RESTAURANT</div>
          <p>Exquisite food, elegant dining, exceptional service.</p>
        </div>
        <div>PH:9025894289</div>
        <div>GMAIL:nawinsres100@gmail.com</div>
        <p>India Restaurant is known for creating unforgettable food experiences. We believe that food is therapy and try to put up a smile on your face with our culinary skills.</p>
        <p>© {new Date().getFullYear()} Nawin's Restaurant</p>
        <Link to ="contact" className="footer-deatails-btn">FOR MORE DETAILS</Link>

      </div>
    </footer>
  );
}
