import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';
import WhatsAppButton from '../WhatsAppButton.jsx';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Layout;
