import React, { useState, useContext } from 'react';

import { useForm } from '../../shared/hook/form-hook';
import Card from '../../shared/components/UIElements/Card';
import { useHttpClient } from '../../shared/hook/http-hook';
import Input from '../../shared/components/FormElements/Input';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import './Auth.css';

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false);
    
    const switchModeHandler = () => {
        if (!isLogin) {
            setFormData(
                {
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                }, formState.inputs.email.isValid && formState.inputs.password.isValid);
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false);
        }
        setIsLogin(prevMode => !prevMode);
    };

    const authSubmitHandler = async event => {
        event.preventDefault();
        // console.log(formState.inputs);

        console.log(formState.inputs);

        if (isLogin) {
            try {
                const responseData = await sendRequest('http://localhost:5000/api/users/login', 'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    }
                );

                auth.login(responseData.user.id);
            } catch (err) {
                
            }
        } else {
            try {
                const responseData = await sendRequest('http://localhost:5000/api/users/signup', 'POST',
                    JSON.stringify({
                        name: formState.inputs.name.value,
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    }
                );
                auth.login(responseData.user.id);
            } catch (err) {

            }
        }
    };

    return (
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        <Card className="authentication">
            {isLoading && <LoadingSpinner asOverlay />}
            <h2>Login Required</h2>
            <hr/>
            <form onSubmit={authSubmitHandler}>
                {!isLogin && ( 
                    <Input
                        element="input"
                        id="name"
                        type="text"
                        label="Name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter name."
                        onInput={inputHandler}
                    />
                )}
                {!isLogin && (
                    <ImageUpload center id="image" onInput={inputHandler} />
                )}
                <Input 
                    element="input" 
                    id="email"
                    type="email"
                    label="E-Mail"
                    validators={[VALIDATOR_EMAIL()]}
                    errorText="Please input valid Email." 
                    onInput={inputHandler}
                />

                <Input 
                    element="input"
                    id="password"
                    type="password"
                    label="Password"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please input valid password, at least 5 characters." 
                    onInput={inputHandler}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    {isLogin ? 'LOGIN' : 'SIGNUP'}
                </Button>
            </form>
            <Button inverse onClick={switchModeHandler}>
                {isLogin ? 'SIGNUP' : 'LOGIN'}
            </Button>
        </Card>
        </React.Fragment>
    );
};

export default Auth;