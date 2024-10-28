import React, { ReactNode } from 'react';
import Header from './header-part/Header';
import Banner from './banner/Banner';
import "./Layout.css";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout-wrap">
            <Header />
            <div className="content-wrap">
                {children}
            </div>
            <Banner />
        </div>
    );
};

export default Layout;
