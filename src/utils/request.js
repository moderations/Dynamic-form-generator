import axios from "axios";

export function mock(data, time = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data)
        }, time)
    })
}

export default function request(options = {}) {
    return axios({
        // baseURL: "URL_ADDRESS",
       ...options
    })
}