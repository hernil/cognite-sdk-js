export interface EitherID {
    /**
     * Javascript friendly internal ID given to the object.
     */
    id?: number;
    /**
     * External Id provided by client. Should be unique within the project
     */
    externalId?: string;
}
