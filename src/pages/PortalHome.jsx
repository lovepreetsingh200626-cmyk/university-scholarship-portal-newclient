import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Bell,
    BookOpen,
    ClipboardList,
    FileCheck2,
    GraduationCap,
    LogIn,
    Search,
    ShieldCheck,
    UserPlus
} from 'lucide-react';
import './student/FreeshipCard.css';

const PortalHome = () => {
    const navigate = useNavigate();

    return (
        <div className="portal-home">
            <div className="portal-home-utility">
                <div className="portal-home-container">
                    <span>Scholarship services for students</span>
                    <span>Secure online applications • Application status updates</span>
                </div>
            </div>

            <header className="portal-home-header">
                <div className="portal-home-container portal-home-header-main">
                    <Link className="portal-home-brand" to="/" aria-label="Scholarship Portal home">
                        <span className="portal-home-emblem"><GraduationCap size={27} /></span>
                        <span><strong>Scholarship Portal</strong><small>Student Scholarship &amp; Freeship Card Services</small></span>
                    </Link>
                    <div className="portal-home-actions">
                        <button className="portal-home-login" type="button" onClick={() => navigate('/login')}><LogIn size={16} /> Student Login</button>
                        <button className="portal-home-register" type="button" onClick={() => navigate('/register')}><UserPlus size={16} /> New Registration</button>
                    </div>
                </div>
                <nav className="portal-home-nav">
                    <div className="portal-home-container portal-home-nav-inner">
                        <Link className="active" to="/">Home</Link>
                        <Link to="/student/scholarships">Scholarship Schemes</Link>
                        <Link to="/scheme-guides">SC / OBC Guidelines</Link>
                        <Link to="/student/freeship-card">Freeship Card</Link>
                        <Link to="/student/applications">Track Application</Link>
                        <a href="#notices">Notices &amp; Help</a>
                    </div>
                </nav>
            </header>

            <div className="portal-home-notice">
                <div className="portal-home-container portal-home-notice-inner">
                    <span className="portal-home-notice-label"><Bell size={15} /> Notice</span>
                    <p>Freeship Card documents: student photo, income certificate, caste certificate, and passing certificate. Keep each scanned file at or below 125 KB.</p>
                    <button type="button" onClick={() => navigate('/login')}>Student Login <ArrowRight size={15} /></button>
                </div>
            </div>

            <main>
                <section className="portal-home-hero">
                    <div className="portal-home-container portal-home-hero-grid">
                        <div className="portal-home-hero-copy">
                            <div className="portal-home-eyebrow"><ShieldCheck size={15} /> STUDENT SERVICES PORTAL</div>
                            <h1>Scholarship support for your next step.</h1>
                            <p>Find scholarship programmes, submit your application and documents, request a Freeship Card, and follow every status update from one student account.</p>
                            <div className="portal-home-hero-actions">
                                <button type="button" className="portal-home-primary" onClick={() => navigate('/login')}>Open Student Corner <ArrowRight size={17} /></button>
                                <button type="button" className="portal-home-secondary" onClick={() => navigate('/student/scholarships')}>View schemes</button>
                            </div>
                        </div>
                        <div className="portal-home-hero-card">
                            <div className="portal-home-hero-card-top"><span className="portal-home-hero-icon"><FileCheck2 size={23} /></span><span className="portal-home-hero-tag">STUDENT CORNER</span></div>
                            <h2>Start or continue an application</h2>
                            <p>Sign in to manage scholarships and your Freeship Card request.</p>
                            <div className="portal-home-corner-links">
                                <button type="button" onClick={() => navigate('/login')}><LogIn size={17} /><span>Student Login</span><ArrowRight size={15} /></button>
                                <button type="button" onClick={() => navigate('/register')}><UserPlus size={17} /><span>Create Student Account</span><ArrowRight size={15} /></button>
                                <button type="button" onClick={() => navigate('/student/applications')}><Search size={17} /><span>Track My Application</span><ArrowRight size={15} /></button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="portal-home-section">
                    <div className="portal-home-container">
                        <div className="portal-home-section-heading">
                            <div><span>ONLINE SERVICES</span><h2>Choose a student service</h2></div>
                            <p>Sign in to save your information and return to your application at any time.</p>
                        </div>
                        <div className="portal-home-service-grid">
                            <article className="portal-home-service-card">
                                <div className="portal-home-service-icon"><BookOpen size={22} /></div>
                                <span className="portal-home-service-kicker">SC / OBC / EBC / DNT</span>
                                <h3>Read scheme guides</h3>
                                <p>Download redesigned post-matric scholarship summaries for students.</p>
                                <button type="button" onClick={() => navigate('/scheme-guides')}>Open scheme guides <ArrowRight size={15} /></button>
                            </article>
                            <article className="portal-home-service-card">
                                <div className="portal-home-service-icon"><GraduationCap size={22} /></div>
                                <span className="portal-home-service-kicker">SCHOLARSHIPS</span>
                                <h3>Explore schemes</h3>
                                <p>Review scholarship listings and their requirements before starting an application.</p>
                                <button type="button" onClick={() => navigate('/student/scholarships')}>Browse schemes <ArrowRight size={15} /></button>
                            </article>
                            <article className="portal-home-service-card portal-home-service-featured">
                                <div className="portal-home-service-icon"><FileCheck2 size={22} /></div>
                                <span className="portal-home-service-kicker">FREESHIP CARD</span>
                                <h3>Apply for a Freeship Card</h3>
                                <p>Complete the details, upload certificates, and send the application for approval.</p>
                                <button type="button" onClick={() => navigate('/student/freeship-card')}>Start Freeship Application <ArrowRight size={15} /></button>
                            </article>
                            <article className="portal-home-service-card">
                                <div className="portal-home-service-icon"><ClipboardList size={22} /></div>
                                <span className="portal-home-service-kicker">APPLICATION STATUS</span>
                                <h3>Follow progress</h3>
                                <p>See submitted applications, correction requests, review decisions, and updates.</p>
                                <button type="button" onClick={() => navigate('/student/applications')}>Track application <ArrowRight size={15} /></button>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="portal-home-help-section" id="notices">
                    <div className="portal-home-container portal-home-help-grid">
                        <div className="portal-home-help-card">
                            <div className="portal-home-help-icon"><BookOpen size={20} /></div>
                            <div><span>BEFORE YOU APPLY</span><h2>Prepare your information and certificates</h2><p>Use the application guide for course history, required certificates, scheme declarations, and the approval steps.</p></div>
                            <button type="button" onClick={() => navigate('/student/freeship-card')}>Read application steps <ArrowRight size={15} /></button>
                        </div>
                        <div className="portal-home-help-panel">
                            <h3>Application process</h3>
                            <ol><li><span>1</span>Sign in and complete the Freeship Card application</li><li><span>2</span>Submit it and wait for administrator approval</li><li><span>3</span>After approval, choose a scheme in Apply Online and submit the scholarship form</li></ol>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="portal-home-footer">
                <div className="portal-home-container portal-home-footer-inner">
                    <div><strong>Scholarship Portal</strong><p>Student scholarship and Freeship Card services</p></div>
                    <div className="portal-home-footer-links"><Link to="/login">Student Login</Link><Link to="/register">Registration</Link><Link to="/admin/login">Administration</Link></div>
                    <small>Use only accurate personal and academic details in your application.</small>
                </div>
            </footer>
        </div>
    );
};

export default PortalHome;
