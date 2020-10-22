import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import { useHttpClient } from '../../shared/hook/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const Users = () => {
    // const USERS = [
    //     {
    //         id: 'u1',
    //         name: 'Fajar',
    //         image: 'https://cdna.artstation.com/p/assets/images/images/015/432/510/large/christopher-sanabria-01-luffy-captain.jpg?1548308209',
    //         places: 3,
    //     }
    // ];
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest('http://localhost:5000/api/users/');

                setLoadedUsers(responseData.users);
            } catch (err) {

            }
        };
        fetchUsers();
    }, [sendRequest]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedUsers && <UsersList items={loadedUsers}/> }
        </React.Fragment>
    );
};

export default Users;