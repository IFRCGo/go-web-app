import {
    useNavigate,
    useLocation,
    To,
} from 'react-router-dom';

function useGoBack() {
    const location = useLocation();
    const navigate = useNavigate();
    const historyEntryExist = location.key !== 'default';

    function goBack(fallback?: To) {
        if (historyEntryExist) {
            navigate(-1);
        } else {
            navigate(fallback ?? '/');
        }
    }
    return goBack;
}

export default useGoBack;
