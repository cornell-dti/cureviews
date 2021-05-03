import React, { Component } from 'react';
import "./css/MobileReviewForm.css";
import "./Form.jsx";

type Props = any

export default class MobileReviewForm extends Component<Props, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="mobile-review-form">
                form goes here
            </div>
        );
    }
}