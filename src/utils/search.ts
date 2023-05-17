import { api } from '#config';
import { request } from '#utils/network';

const MAX_VIEW_PER_SECTION = 3;
const MAX_VIEW_SEARCH_POPUP = 10;

interface SearchItem {
  id: string;
  name: string;
  event_id?: string;
}

export function loadOptions(input: string, callback: (val: []) => void) {
  if (!input) {
    return Promise.resolve({ options: [] });
  }
  return request(`${api}api/v1/search/?keyword=${input}`).then(d => {
    if (input.length >= 3) {
      const countryList = d.countries.map((country: SearchItem) => {
        return {
          value: `/countries/${country.id}`,
          label: `Country: ${country.name}`
        };
      });
      const countryData = countryList.slice(0, MAX_VIEW_PER_SECTION);

      const regionList = d.regions.map((region: SearchItem) => {
        return {
          value: `/regions/${region.id}`,
          label: `Region: ${region.name}`
        };
      });
      const regionData = regionList.slice(0, MAX_VIEW_PER_SECTION);

      const emergencyList = d.emergencies.map((emergency: SearchItem) => {
        return {
          value: `/emergencies/${emergency.id}`,
          label: `Emergency: ${emergency.name}`
        };
      });
      const emergencyData = emergencyList.slice(0, MAX_VIEW_PER_SECTION);

      const projectList = d.projects.map((project: SearchItem) => {
        return {
          value: `/three-w/${project.event_id}`,
          label: `3W Project: ${project.name}`
        };
      });
      const projectData = projectList.slice(0, MAX_VIEW_PER_SECTION);

      const reportList = d.reports.map((report: SearchItem) => {
        return {
          value: `/reports/${report.id}`,
          label: `Report: ${report.name}`
        };
      });
      const reportData = reportList.slice(0, MAX_VIEW_PER_SECTION);

      const latestList = countryData.concat(
        regionData,
        emergencyData,
        projectData,
        reportData
      ).slice(0, MAX_VIEW_SEARCH_POPUP);

      callback(latestList);
    }
  });
}
