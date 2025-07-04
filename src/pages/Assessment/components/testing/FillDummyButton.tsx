import React from "react";

interface FillDummyButtonProps {
  setValue: (field: string, value: any) => void;
}

const FillDummyButton: React.FC<FillDummyButtonProps> = ({ setValue }) => {
  const fillDummyData = () => {
    setValue('street', '123 Main St');
    setValue('ownerDetails.td', '2024-001-001');
    setValue('ownerDetails.owner', 'Juan Dela Cruz');
    setValue('ownerDetails.ownerAddress', '456 Sample Ave, Sample City');
    setValue('ownerDetails.admin_ben_user', 'Maria Clara');
    setValue('ownerDetails.transactionCode', 'TXN12345');
    setValue('ownerDetails.pin', '1234-5678-9012-3456');
    setValue('ownerDetails.tin', '123-456-789-000');
    setValue('ownerDetails.telNo', '09171234567');
    setValue('landReference.land_owner', 'Pedro Penduko');
    setValue('landReference.block_no', 'B1');
    setValue('landReference.tdn_no', 'TDN-001');
    setValue('landReference.pin', '2345-6789-0123-4567');
    setValue('landReference.lot_no', 'L2');
    setValue('landReference.survey_no', 'SVY-123');
    setValue('landReference.area', '150.5');
    setValue('buildingLocation.address_municipality', 'Sample Municipality');
    setValue('buildingLocation.address_barangay', 'Sample Barangay');
    setValue('buildingLocation.street', '789 Demo St');
    setValue('address_municipality', 'Sample Municipality');
    setValue('address_barangay', 'Sample Barangay');
    setValue('address_province', 'Sample Province');
    setValue('generalDescription.building_permit_no', 'BP-2024-001');
    setValue('generalDescription.certificate_of_completion_issued_on', '2024-01-01');
    setValue('generalDescription.certificate_of_occupancy_issued_on', '2024-02-01');
    setValue('generalDescription.date_of_occupied', '2024-03-01');
    setValue('generalDescription.bldg_age', '5');
    setValue('generalDescription.no_of_storeys', '2');
    setValue('generalDescription.area_of_1st_floor', '100');
    setValue('generalDescription.area_of_2nd_floor', '50.5');
    setValue('generalDescription.area_of_3rd_floor', '');
    setValue('generalDescription.area_of_4th_floor', '');
    setValue('generalDescription.total_floor_area', '150.5');
    setValue('approvalSection.appraisedBy', 'Appraiser Name');
    setValue('approvalSection.appraisedDate', '2024-04-01');
    setValue('approvalSection.recommendingApproval', 'Approver Name');
    setValue('approvalSection.municipalityAssessorDate', '2024-04-02');
    setValue('approvalSection.approvedByProvince', 'Provincial Approver');
    setValue('approvalSection.provincialAssessorDate', '2024-04-03');
    setValue('memoranda', [
      { date: '2024-05-01', details: 'Sample memorandum details.' }
    ]);
    setValue('recordOfSupersededAssessment.records', [
      {
        pin: '3456-7890-1234-5678',
        tdArpNo: 'TD-002',
        totalAssessedValue: 100000,
        previousOwner: 'Old Owner',
        dateOfEffectivity: '2023-01-01',
        date: '2023-01-02',
        assessment: 'Assessment Info',
        taxMapping: 'Tax Map',
        records: 'Record Info'
      }
    ]);
  };

  return (
    <button
      type="button"
      className="btn btn-secondary mb-4"
      onClick={fillDummyData}
    >
      Fill Dummy Data
    </button>
  );
};

export default FillDummyButton;
