declare module '@ovhcloud/node-ovh' {
    interface OvhConfig {
        endpoint: string;
        appKey?: string;
        appSecret?: string;
        consumerKey?: string;
        clientID?: string;
        clientSecret?: string;
    }

    interface OvhClient {
        requestPromised(method: string, path: string, data?: any): Promise<any>;
        request(method: string, path: string, data?: any, callback?: (err: any, result: any) => void): void;
    }

    function ovh(config: OvhConfig): OvhClient;

    export default ovh;
    export = ovh;
}

// Also declare for CommonJS compatibility
declare module 'ovh' {
    export = require('@ovhcloud/node-ovh');
}

// OVH API Response Types
export interface OvhUserInfo {
    nichandle: string;
    name: string;
    firstname: string;
    nameUnicode?: string;
    firstnameUnicode?: string;
    email: string;
    ovhCompany: string;
    ovhSubsidiary: string;
    currency: {
        code: string;
        symbol: string;
    };
    language: string;
    country: string;
    state: string;
    vat?: string;
    birthDay?: string;
    area?: string;
    organisation?: string;
    address?: string;
    city?: string;
    zip?: string;
    sex?: 'male' | 'female';
    phone?: string;
    fax?: string;
    companyNationalIdentificationNumber?: string;
    nationalIdentificationNumber?: string;
    spareEmail?: string;
    smsAccount?: string;
}

export interface OvhBill {
    billId: string;
    date: string;
    expirationDate: string;
    priceWithTax: {
        currencyCode: string;
        value: number;
        text: string;
    };
    priceWithoutTax: {
        currencyCode: string;
        value: number;
        text: string;
    };
    tax: {
        currencyCode: string;
        value: number;
        text: string;
    };
    url: string;
    pdfUrl: string;
    password: string;
    category: string;
}

export interface OvhService {
    serviceId: string;
    domain: string;
    serviceType: string;
    resource?: {
        name: string;
        displayName: string;
        state: string;
    };
    billing?: {
        nextBillingDate?: string;
        pricing?: {
            price: {
                currencyCode: string;
                value: number;
            };
            interval: number;
            intervalUnit: string;
        };
    };
}

// API Endpoint Types
export type OvhEndpoint =
    | 'ovh-eu'
    | 'ovh-us'
    | 'ovh-ca'
    | 'soyoustart-eu'
    | 'soyoustart-ca'
    | 'kimsufi-eu'
    | 'kimsufi-ca';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
