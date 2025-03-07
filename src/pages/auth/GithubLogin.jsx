import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const GITHUB_CLIENT_ID = 'Ov23liDt1cBCD2aFlRUl';
const REDIRECT_URI = 'http://localhost:3000/auth/github/callback'; // Replace with your callback URL

function GithubLogin(){
    useEffect(() => {
        const queryString=window.location.search;
        const urlParams=new URLSearchParams(queryString);
        const code=urlParams.get('code'); 
        console.log("ahawa l code ",code);
    }, []);   

    function loginWithGithub() {
        window.location.assign("https://github.com/login/oauth/authtorize?client_id"+GITHUB_CLIENT_ID)
    }
}

export default GithubLogin;