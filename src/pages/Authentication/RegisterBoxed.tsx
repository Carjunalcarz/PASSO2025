import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconUser from '../../components/Icon/IconUser';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconGoogle from '../../components/Icon/IconGoogle';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

// Municipalities list
const MUNICIPALITIES = [
    'Province Agusan del Norte',
    'Buenavista',
    'Carmen',
    'Jabonga',
    'Kitcharao',
    'Las Nieves',
    'Magallanes',
    'Nasipit',
    'Remedios T. Romualdez',
    'Santiago',
    'Tubay',
];

// Municipal roles
const MUNICIPAL_ROLES = [
    { value: 'admin', label: 'Administrator' },
    { value: 'assessor', label: 'Municipal Assessor' },
    { value: 'encoder', label: 'Data Encoder' },
    { value: 'viewer', label: 'Viewer' },
];

// Provincial roles
const PROVINCIAL_ROLES = [
    { value: 'provincial_assessor', label: 'Provincial Assessor' },
    { value: 'provincial_encoder', label: 'Provincial Encoder' },
    { value: 'provincial_record', label: 'Provincial Record' },
    { value: 'provincial_inspector', label: 'Provincial Inspector' },
];

// Form Schema
const registerSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    municipality: yup.string().required('Municipality is required'),
    role: yup.string().required('Role is required'),
});

type RegisterFormInputs = {
    name: string;
    email: string;
    password: string;
    municipality: string;
    role: string;
};

const RegisterBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [registerError, setRegisterError] = useState<string>('');
    const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
    const { user, loading, register: registerUser, isAuthenticated } = useAuth();

    useEffect(() => {
        dispatch(setPageTitle('Register Boxed'));
    }, [dispatch]);

    // Redirect if user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    // Registration mutation
    const registerMutation = useMutation({
        mutationFn: async (data: RegisterFormInputs) => {
            await registerUser(data.email, data.password, data.name, data.municipality, data.role);
        },
        onSuccess: () => {
            console.log("✅ Appwrite Registration Success");
            setRegisterError('');
            navigate('/');
        },
        onError: (error: Error) => {
            console.error('❌ Appwrite Registration failed:', error);
            setRegisterError(error.message || 'Registration failed. Please try again.');
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<RegisterFormInputs>({
        resolver: yupResolver(registerSchema),
    });

    // Watch municipality changes
    const watchMunicipality = watch('municipality');

    // Update selected municipality and reset role when municipality changes
    useEffect(() => {
        if (watchMunicipality !== selectedMunicipality) {
            setSelectedMunicipality(watchMunicipality);
            // Reset role when municipality changes
            setValue('role', '');
        }
    }, [watchMunicipality, selectedMunicipality, setValue]);

    // Determine which roles to show based on selected municipality
    const availableRoles = selectedMunicipality === 'Province Agusan del Norte' 
        ? PROVINCIAL_ROLES 
        : MUNICIPAL_ROLES;

    const submitForm = (data: RegisterFormInputs) => {
        setRegisterError('');
        registerMutation.mutate(data);
    };

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Don't render register form if user is authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="absolute top-6 end-6">
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                                    button={
                                        <>
                                            <div>
                                                <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                                            </div>
                                            <div className="text-base font-bold uppercase">{flag}</div>
                                            <span className="shrink-0">
                                                <IconCaretDown />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
                                        {themeConfig.languageList.map((item: any) => {
                                            return (
                                                <li key={item.code}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full hover:text-primary rounded-lg ${flag === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => {
                                                            i18next.changeLanguage(item.code);
                                                            // setFlag(item.code);
                                                            setLocale(item.code);
                                                        }}
                                                    >
                                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign Up</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to register</p>
                            </div>
                            {/* Error Message */}
                            {registerError && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {registerError}
                                </div>
                            )}

                            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit(submitForm)}>
                                <div>
                                    <label htmlFor="Name">Name</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            {...register('name')}
                                            id="Name" 
                                            type="text" 
                                            placeholder="Enter Name" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            disabled={registerMutation.isPending}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            {...register('email')}
                                            id="Email" 
                                            type="email" 
                                            placeholder="Enter Email" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            disabled={registerMutation.isPending}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            {...register('password')}
                                            id="Password" 
                                            type="password" 
                                            placeholder="Enter Password" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            disabled={registerMutation.isPending}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="Municipality">Municipality</label>
                                    <div className="relative text-white-dark">
                                        <select
                                            {...register('municipality')}
                                            id="Municipality"
                                            className="form-select ps-10 placeholder:text-white-dark"
                                            disabled={registerMutation.isPending}
                                        >
                                            <option value="">Select Municipality</option>
                                            {MUNICIPALITIES.map((mun) => (
                                                <option key={mun} value={mun}>
                                                    {mun}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                    {errors.municipality && <p className="text-red-500 text-sm mt-1">{errors.municipality.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="Role">Role</label>
                                    <div className="relative text-white-dark">
                                        <select
                                            {...register('role')}
                                            id="Role"
                                            className="form-select ps-10 placeholder:text-white-dark"
                                            disabled={registerMutation.isPending || !selectedMunicipality}
                                        >
                                            <option value="">
                                                {selectedMunicipality ? 'Select Role' : 'Select Municipality First'}
                                            </option>
                                            {availableRoles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                                <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                                </div>
                                <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                                        <span className="text-white-dark">Subscribe to weekly newsletter</span>
                                    </label>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <span className="flex items-center justify-center">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                            Signing up...
                                        </span>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </form>
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconInstagram />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconFacebookCircle />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconTwitter fill={true} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-center dark:text-white">
                                Already have an account ?&nbsp;
                                <Link to="/auth/boxed-signin" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN IN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterBoxed;
