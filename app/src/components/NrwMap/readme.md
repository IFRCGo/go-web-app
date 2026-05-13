# NRW Map Component

(Note: this readme is here while this component is in dev. The goal is to enable anyone to setup and test the changes. The content here should be reworked or moved to another readme as dev wraps up on this.)

This component will be the shared NRW map component.

The "Nrw..." prefix naming of the files and components is to help tell the new changes apart from existing GO components. More general components will be derived from these after working more with the TC team.

The "Ol..." prefix stands for OpenLayers (the mapping front library used), and this naming is also subject to change (once we work with the TC team more).

## Basic Architecture

- The `NrwMap` component is the main container for all the NRW mapping components.
- The `useNrwDataLoader` hook is the shared object used for loading/caching all data. This joins the UI logic of loading/selecting data between the UI components and the data map component.
- `OlDataMap` is the NRW map component. It handles admin area rendering/selection, and can have any data layer added to it.
- `OlGlobalMap` is a general global view component that can be used for global map interaction.
- `NrwControlPanel` and `NrwLayerPanel` are the UI interaction layers.

## Running Locally

(Note: This is the temporary setup process and will change as dev progresses)

The NRW frontend can be launched either from this project, or from the [standalone NRW project in the IBF repo](https://github.com/rodekruis/IBF/blob/main/portal/nrw-standalone/README.md). For launching from this repo, see the setup steps below:

1. Launch the [IBF back-end services](https://github.com/rodekruis/IBF/blob/main/services/docker-compose.yml). See [README](https://github.com/rodekruis/IBF/blob/main/README.md).
2. Populate the admin areas with the [upload_admin_areas.py script](https://github.com/rodekruis/IBF/blob/main/data/data_management/data_upload/upload_admin_areas.py). This requires a local copy of the seed-data-repo, so you'll need to clone that as well. See the [IBF data readme](https://github.com/rodekruis/IBF/blob/main/data/README.md) for more info.
3. Set up this repo to run, following the readme in the base directory. Be sure to recopy `sample.env` into `.env` each time there were any changes in example.env.
4. Launch with `pnpm start` from `/go-web-app/app`.
5. Navigate to `localhost:3000/nrw?c=<valid ISO_A3 country code>`, such as http://localhost:3000/nrw?c=mwi

## Testing

- Unit testing is under development, but will be added as part of this repo.
- End-to-end testing for IBF backend integration will be carried out in the [IBF repo](https://github.com/rodekruis/IBF).
