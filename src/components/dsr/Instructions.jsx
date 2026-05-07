import React from 'react';
import { Accordion, Alert } from 'react-bootstrap';

const Instructions = ({ dsrParam = '05' }) => {
  const isNewPurchaserVisit = dsrParam === '50' || dsrParam === '61';
  const isRuralVisit = dsrParam === '01' || dsrParam === '02';

  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <h6 className="mb-0">Instructions</h6>
        </Accordion.Header>
        <Accordion.Body>
          <div className="border rounded p-3 bg-light">
            <ul className="mb-0">
              {isRuralVisit && (
                <li>
                  <strong className="text-danger">
                    * Dear User, Given Below Two Activity Type For Rural Type Retailer And Stockiest
                  </strong>
                </li>
              )}
              <li>
                <strong className="text-danger">
                  * Visit to Stockiest(Trade Purchaser) / Retailer
                </strong>
              </li>
              {isNewPurchaserVisit && (
                <>
                  <li>
                    <strong className="text-danger">
                      * Meeting with New Purchaser(Trade Purchaser) / Retailer : Please Must be Add Mobile No 
                      otherwise it is not consider in new Retailer Visit Count in report(For Unique Visit We require Mobile No)
                    </strong>
                  </li>
                  <li>
                    <strong className="text-danger">
                      * Dear User : Please Do not use existing retailers Mobile Number other wise it is not cosider in new retailer.
                    </strong>
                  </li>
                </>
              )}
              <li>
                DSR Entry allowed only between <strong>08:30 AM</strong> and <strong>09:30 PM</strong>
              </li>
            </ul>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default Instructions;