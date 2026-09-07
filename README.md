# Azure DevOps ACR AKS Workshop

This standalone starter is hosted on GitHub and runs with Azure Pipelines. It contains the Node.js sample app, Docker build contexts, Kubernetes manifest examples, and eight pipelines for CI, ACR, and AKS. These are Azure Pipelines YAML files, not GitHub Actions workflows.

## Get Your Copy

Public template: [AkashAi7/azure-devops-acr-aks-workshop](https://github.com/AkashAi7/azure-devops-acr-aks-workshop).

Select [Use this template](https://github.com/AkashAi7/azure-devops-acr-aks-workshop/generate) to create your own repository. Keep `app/`, `docker/`, and `pipelines/` at the repository root; the pipeline paths depend on this layout.

## Folder layout

- `app/` Node.js sample app source and tests
- `docker/` Dockerfiles and nginx static content
- `k8s/app/` Kubernetes manifests for the sample app
- `k8s/workshop/` Workshop deployment/service examples for the default namespace
- `pipelines/` Azure DevOps pipeline templates

## Quick start

1. Select **Use this template > Create a new repository** on GitHub, or fork the starter. Use your own copy so you can commit your participant settings.
2. Create or select your Azure DevOps project. Confirm Microsoft-hosted agent capacity is available for `ubuntu-latest`.
3. In Azure DevOps, select **Pipelines > New pipeline > GitHub**, authorize access to your copy, then choose **Existing Azure Pipelines YAML file**, branch `main`, and `/pipelines/basic-ci.yml`. Save and run it. Basic CI needs no Azure service connection or Azure resources.
4. For the Azure labs, obtain an existing ACR and AKS cluster from your facilitator, or provision them separately. Create an Azure Resource Manager service connection using workload identity federation, scoped to the required resources. It needs permissions for the selected ACR operation, AKS credential retrieval, and Kubernetes deployment. Authorize only the intended pipelines. AKS also needs permission to pull images from ACR, and agents need network access to the services.
5. Edit [pipelines/workshop-variables.yml](pipelines/workshop-variables.yml) in your GitHub copy and commit your settings. Replace all five `REPLACE_WITH_*` values using the table below. Do not commit credentials.
6. Register additional pipelines using the same GitHub connection and the YAML paths in the pipeline guide. Run `/pipelines/acr-to-aks-nginx.yml` for the simplest complete image-build and deployment exercise, or `/pipelines/full-workshop.yml` for app tests, image build, and deployment.

| Setting | Participant value |
| --- | --- |
| `azureSubscription` | Exact Azure DevOps service connection name, not the Azure subscription ID |
| `acrName` | ACR resource name, without `.azurecr.io` |
| `aksResourceGroup` | Resource group containing the AKS cluster |
| `aksClusterName` | AKS cluster resource name |
| `participantName` | Unique lowercase letters and numbers, for example `student01` |
| `aksNamespace` | An existing namespace you can deploy into; defaults to `default` |

Image repository and workload names are derived from `participantName`. These names avoid participant collisions but do not provide security isolation. A facilitator must create and authorize any custom namespace before it is used; the pipelines do not create namespaces or Azure resources.

All eight pipelines disable YAML push and PR triggers. Run them manually; do not enable UI trigger overrides or schedules for this workshop. GitHub authorization and Azure resource authorization are separate setup steps. Creating a GitHub copy does not create Azure DevOps pipeline definitions or service connections automatically.

### Alternative: Import Into Azure Repos

For an Azure Repos-focused workshop, select **Repos > Files > Import repository** in each participant's Azure DevOps project and supply the standalone GitHub clone URL. Then edit the shared variables in that imported repository and create pipelines using **Azure Repos Git** instead of **GitHub**. An import is a separate copy; later GitHub changes do not synchronize automatically.

### Image Sequencing

The app and Nginx exercises share one image repository and overwrite its `latest` tag. Run them sequentially. Before every run of `aks-deploy-nginx.yml`, run `acr-build-nginx.yml` so `latest` contains Nginx, not the Node app. The combined build/deploy pipelines deploy their own immutable build-ID tags. Importing the base Nginx image is an ACR exercise, not a substitute for building the workshop web content.

## Pipeline guide

- `basic-ci.yml`:
  Basic Node CI (install, test, archive, publish artifact).
- `acr-import-nginx.yml`:
  Import public nginx image into ACR.
- `acr-build-nginx.yml`:
  Build nginx image from `docker/Dockerfile.nginx` and push to ACR.
- `aks-deploy-nginx.yml`:
  Deploy nginx workload directly to AKS.
- `acr-to-aks-app.yml`:
  Build app image and deploy to AKS.
- `acr-to-aks-nginx.yml`:
  Build nginx image and deploy to AKS.
- `full-workshop.yml`:
  Multi-stage test/build/deploy pipeline for the Node.js app.
- `test-demo.yml`:
  Minimal two-stage test/deploy demo pipeline.

## Notes

- The Docker and pipeline paths are aligned to the standalone repository layout.
- Use `app/` if you want to iterate on Node app behavior and tests.
- Use nginx-based pipelines for the simplest container and AKS flow demos.
- All public base images come from Microsoft Container Registry (MCR).
- Builds run remotely in ACR; participants do not need a local Docker daemon.
- AKS services use ClusterIP and are internal, not public web endpoints.
- AKS pipelines generate manifests from shared variables inline. Files under `k8s/` are static reference examples, not participant-configured deployment inputs.
