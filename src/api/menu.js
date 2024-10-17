import {mock} from '@/utils/request';
import {openDB, updateDB, getDataByIndex, deleteDB, getDataByKey} from '@/utils/db';

export function setSettingFormTemplate(data) {
    return new Promise(async (resolve, reject) => {
        const db = await openDB('template').catch(e => e);

        if( typeof db === 'string' ) return reject({code: 201, msg: db});
        if( db instanceof Error ) return reject({code: 201, msg: db.message});

        const request = await updateDB(db, 'template', data).catch(e => e);

        if( request instanceof Error ) return reject({code: 201, msg: request.message});
        return resolve({code: 200});
    })
    // return mock({
    //     code: 200
    // })
}

export function getSettingFormTemplate({type} = {}) {
    return new Promise(async (resolve, reject) => {
        const db = await openDB('template').catch(e => e);

        if( typeof db === 'string' ) return reject({code: 201, msg: db});
        if( db instanceof Error ) return reject({code: 201, msg: db.message});

        const data = await getDataByKey(db, 'template', type).catch(e => e);

        if( data instanceof Error ) return reject({code: 201, msg: data.message});
        return resolve({code: 200, data: JSON.parse(data.template) || []});
    })
    // return mock({
    //     code: 200,
    //     data: {}
    // })
}