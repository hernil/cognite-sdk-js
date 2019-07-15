export interface DatapointsPostDatapoint {
    /**
     * A JavaScript-friendly internal ID for the object.
     */
    id?: number;
    /**
     * The list of datapoints. The limit per request is 100000 datapoints.
     */
    datapoints: Datapoint[];
    /**
     * The external ID provided by the client. Must be unique within the project.
     */
    externalId?: string;
}

export interface Datapoint {
    /**
     * The timestamp in milliseconds since the epoch (Jan 1, 1970).
     */
    timestamp: number;
    /**
     * The numerical data value of a numerical metric.
     *
     * The string data value of a string metric.
     */
    value: Value;
}

export type Value = number | string;
