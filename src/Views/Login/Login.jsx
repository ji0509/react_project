import 'Css/index.css'
import AuthLogin from 'Components/Login/AuthLogin';
import AuthCert from 'Components/Login/AuthCert';
import { useSelector } from 'react-redux';

export default function Login() {

    const uAuth = useSelector((state) => state.uAuth)
    return (
        <div className="index_container">
            <div className='index_img_container'></div>
            <div className='index_sign_container'>
                <div className='index_logo'>
                    <img alt={``} />
                </div>
                <div className='index_signin'>
                    <span>Sign in</span>
                </div>
                {uAuth.token ? <AuthCert/> : <AuthLogin/>}
            </div>
        </div>
    );
}