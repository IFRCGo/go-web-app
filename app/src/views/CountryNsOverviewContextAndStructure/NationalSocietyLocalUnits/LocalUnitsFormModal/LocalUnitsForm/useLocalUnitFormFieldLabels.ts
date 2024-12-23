import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

interface Props {
    key: string;
}
function useLocalUnitFormFieldLabels(props: Props) {
    const {
        key,
    } = props;

    const strings = useTranslation(i18n);
    const localUnitFormFieldLabels = {
        type: strings.type,
        visibility: strings.visibility,
        date_of_data: strings.dateOfUpdate,
        subtype: strings.subtype,
        english_branch_name: strings.localUnitNameEn,
        local_branch_name: strings.localUnitNameLocal,
        level: strings.coverage,
        focal_person_en: strings.focalPersonEn,
        focal_person_loc: strings.focalPersonLocal,
        source_en: strings.sourceEn,
        source_loc: strings.sourceLocal,
        country: strings.country,
        address_en: strings.addressEn,
        address_loc: strings.addressLocal,
        city_en: strings.localityEn,
        city_loc: strings.localityLocal,
        postcode: strings.postCode,
        phone: strings.phone,
        email: strings.email,
        link: strings.website,
        'location_json.lat': strings.latitude,
        'location_json.lng': strings.longitude,
        'health.affiliation': strings.affiliation,
        'health.other_affiliation': strings.otherAffiliation,
        'health.functionality': strings.functionality,
        'health.is_teaching_hospital': strings.teachingHospital,
        'health.hospital_type': strings.hospitalType,
        'health.is_in_patient_capacity': strings.inPatientCapacity,
        'health.is_isolation_rooms_wards': strings.isolationRoomsWards,
        'health.focal_point_position': strings.focalPointPosition,
        'health.focal_point_email': strings.focalPointEmail,
        'health.focal_point_phone_number': strings.focalPointPhoneNumber,
        'health.health_facility_type': strings.healthFacilityType,
        'health.other_facility_type': strings.otherFacilityType,
        'health.primary_health_care_center': strings.primaryHealthCareCenter,
        'health.speciality': strings.specialist,
        'health.general_medical_services': strings.generalMedicalServices,
        'health.specialized_medical_beyond_primary_level': strings.specializedMedicalService,
        'health.other_services': strings.otherServices,
        'health.blood_services': strings.bloodServices,
        'health.professional_training_facilities': strings.professionalTrainingFacilities,
        'health.number_of_isolation_rooms': strings.numberOfIsolationRooms,
        'health.maximum_capacity': strings.maximumCapacity,
        'health.is_warehousing': strings.warehousing,
        'health.is_cold_chain': strings.coldChain,
        'health.ambulance_type_a': strings.ambulanceTypeA,
        'health.ambulance_type_b': strings.ambulanceTypeB,
        'health.ambulance_type_c': strings.ambulanceTypeC,
        'health.total_number_of_human_resource': strings.totalNumberOfHumanResources,
        'health.general_practitioner': strings.generalPractitioner,
        'health.specialist': strings.specialist,
        'health.residents_doctor': strings.residentsDoctor,
        'health.nurse': strings.nurse,
        'health.dentist': strings.dentist,
        'health.nursing_aid': strings.nursingAid,
        'health.midwife': strings.midwife,
        'health.other_medical_heal': strings.otherMedicalHeal,
        'health.other_profiles': strings.otherProfiles,
        'health.feedback': strings.commentsNS,
    };

    const value = localUnitFormFieldLabels[key as keyof typeof localUnitFormFieldLabels];
    return [value];
}

export default useLocalUnitFormFieldLabels;
