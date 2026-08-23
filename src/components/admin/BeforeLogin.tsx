import { PasswordEyeToggle } from "@/components/admin/PasswordEyeToggle";

/** Branded welcome message above the admin login form. */
export default function BeforeLogin() {
  return (
    <>
      {/* Also mount here so the eye appears immediately on /admin/login */}
      <PasswordEyeToggle />
      <div className="amcham-login-intro">
        <span className="amcham-login-badge">
          <span className="amcham-login-star">★</span> American Chamber of Commerce in Cameroon
        </span>
        <h2 className="amcham-login-title">Welcome back</h2>
        <p className="amcham-login-text">
          Sign in to manage banners, news, events, newsletters, members and every page of the
          AmCham&nbsp;Cameroon website. Changes go live instantly.
        </p>
      </div>
    </>
  );
}
