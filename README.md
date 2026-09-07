# Azure DevOps ACR AKS Workshop

Build confidence one run at a time: pipeline basics, real tests, container builds, and Kubernetes deployments. GitHub hosts the source; **Azure Pipelines runs the automation**. These files are not GitHub Actions workflows.

**[Create your workshop copy](https://github.com/AkashAi7/azure-devops-acr-aks-workshop/generate)** | [Public starter](https://github.com/AkashAi7/azure-devops-acr-aks-workshop)

## Choose Your Route

| Route | Sequence | Use it when |
| --- | --- | --- |
| Main walkthrough | Demo 1 → Demo 2 → Azure setup → Demo 3 → Demo 4 | You want the complete story without repeating deployment exercises. |
| Detailed walkthrough | Main route, with optional labs A → B → C before Demo 3 | You want to isolate registry access, image builds, and deployment. |
| CI only | Demo 1 → Demo 2 | Azure resources or permissions are not ready yet. |

[Start here](#before-you-start) · [Run a pipeline](#create-and-run-a-pipeline) · [Azure setup](#connect-your-azure-target) · [Optional labs](#optional-labs) · [Troubleshooting](#when-a-run-does-not-pass)

Expand each demo for instructions and checkpoints. GitHub renders these checklists as a guide; to persist your progress, edit the boxes in your own README from `[ ]` to `[x]` and commit. Viewing this page does not record progress or run pipelines.

## Before You Start

### Participant Checklist

- [ ] Create your own repository using **Use this template > Create a new repository**, or fork the starter.
- [ ] Keep `app/`, `docker/`, and `pipelines/` at the repository root; do not nest the starter in another folder.
- [ ] Confirm your Azure DevOps organization and assigned project with the facilitator.
- [ ] Confirm you can create/run pipelines and authorize access to your GitHub copy.
- [ ] Obtain a unique participant identifier such as `student01`. Run only one workshop pipeline at a time per participant.

The first two demos need no Azure service connection or Azure resources. Cloud demos use existing ACR and AKS resources and can incur charges. Nothing here provisions those resources automatically. Local Docker is not required: builds run remotely in ACR.

<details>
<summary>Facilitator checklist for eight participants</summary>

- [ ] Assign separate participant repositories and preferably separate Azure DevOps projects/service connections.
- [ ] Assign unique names, for example `student01` through `student08`. Names prevent collisions; they are not an RBAC security boundary.
- [ ] Confirm eight Microsoft-hosted parallel jobs in **Organization settings > Pipelines > Parallel jobs**, or nine if the instructor also runs a job. This is organization-wide capacity, not a reservation per participant; unrelated jobs consume it too.
- [ ] Obtain billing approval for paid capacity. Allow up to 30 minutes after saving a capacity change, and test concurrent runs before the session.
- [ ] Verify service connection authorization, ACR build/import permissions, AKS credential access, Kubernetes deployment permissions, and AKS-to-ACR pull access.
- [ ] Prefer pre-created participant namespaces with appropriate access. If using shared `default`, explain that naming separation does not isolate access.
- [ ] Confirm agent network access to ACR and the AKS API, registry build capacity, and sufficient AKS node resources for all participants.

All starter pipelines use Microsoft-hosted `ubuntu-latest`. Adding self-hosted agents does not add hosted capacity. See [parallel-job guidance](https://learn.microsoft.com/en-us/azure/devops/pipelines/licensing/concurrent-jobs?view=azure-devops).

</details>

## Create And Run A Pipeline

Repeat this process for each selected demo; you do not need to register all eight pipelines.

1. In your Azure DevOps project, select **Pipelines > New pipeline > GitHub**.
2. Authorize the GitHub connection for your own repository and select that repository.
3. Choose **Existing Azure Pipelines YAML file**, select `main`, and enter the YAML path shown in the demo.
4. Review the YAML. Save it, then run it, or choose **Run** if the wizard offers that action directly. For an Azure demo, finish Azure setup before this step.
5. Rename the saved pipeline to a recognizable name, such as `student01-demo-1`. On later runs, open that pipeline and select **Run pipeline**, using the branch containing your changes.
6. Open the run, select a job, and inspect its individual task logs. Wait for the **overall run** to show **Succeeded**, not just an individual green task.

All eight YAML files specify `trigger: none` and `pr: none`. Commits do not automatically start them; keep UI trigger overrides and schedules disabled. If an authorization prompt appears, ask the project owner to authorize that specific pipeline, not every pipeline globally.

<details>
<summary>Alternative: use an Azure Repos copy</summary>

Select **Repos > Files > Import repository** in your assigned Azure DevOps project. Use `https://github.com/AkashAi7/azure-devops-acr-aks-workshop.git` as the clone URL. Configure your participant values in that imported copy, then choose **Azure Repos Git** instead of **GitHub** when creating pipelines.

Choose one source of truth for the session. An import is an independent copy; later GitHub commits do not synchronize automatically. Make changes in the repository your pipeline actually checks out.

</details>

## Demo 1: Pipeline Basics

<details open>
<summary>Run a simulation and explore stages, variables, and artifacts</summary>

**Pipeline:** [pipelines/test-demo.yml](pipelines/test-demo.yml). Wizard path: `/pipelines/test-demo.yml`.

**Why:** understand the pipeline interface before introducing application or Azure failures. Tests and deployment in this demo are simulated.

1. Create and run this pipeline using the steps above.
2. Open the Build stage logs. Find the message containing `workshop-demo` and `training`.
3. Open the published `demo-output` artifact from the run summary and inspect its text file.
4. Open the Deploy stage logs and find the deployment simulation message.

- [ ] Both stages and the overall run succeeded.
- [ ] I found the artifact and can distinguish a stage, job, and step.

**Try it:** change `environmentName` to `practice` in your copy of the pipeline, commit, and manually rerun. The log and artifact should reflect the new value. No application has been deployed.

**Discuss:** does a log line saying "Tests passed" prove that tests actually executed?

</details>

## Demo 2: Real Continuous Integration

<details>
<summary>Test the Node.js app and inspect the packaged artifact</summary>

**Pipeline:** [pipelines/basic-ci.yml](pipelines/basic-ci.yml). Wizard path: `/pipelines/basic-ci.yml`.

**Why:** check application behavior before producing something another stage or person can consume.

1. Run the pipeline and inspect the dependency-install and unit-test task logs.
2. Confirm the Node test runner reports one passing test and zero failures for the unchanged starter. Test results are currently printed in logs, not published as a dedicated test-results report.
3. Open the `workshop-app` artifact from the run summary and inspect its ZIP contents.
4. Compare [app/src/app.js](app/src/app.js) with [app/tests/app.test.js](app/tests/app.test.js).

- [ ] A real test ran successfully.
- [ ] The run published the application archive.

**Try it:** in your own branch, change only the expected message in the test to an incorrect value, then run this pipeline against that branch. Confirm the test fails and the later archive/publish steps are skipped. Restore only your test edit and rerun successfully before continuing.

**Discuss:** how is this ZIP artifact different from a container image? This pipeline does not build an image or deploy to AKS.

</details>

## Connect Your Azure Target

Complete this checkpoint before any cloud lab. Use only resources assigned by your facilitator.

1. In **Project settings > Service connections**, create or select an **Azure Resource Manager** connection using workload identity federation. Ask the facilitator to handle any permissions you cannot grant.
2. Confirm it has the required scope for the selected ACR operation and AKS credential retrieval, plus Kubernetes permissions to manage the assigned workloads. AKS itself needs permission to pull images from ACR. GitHub access and Azure access are separate authorizations.
3. Edit [pipelines/workshop-variables.yml](pipelines/workshop-variables.yml) in the repository and branch your pipelines use. Replace all five placeholders and commit.

| Variable | Enter |
| --- | --- |
| `azureSubscription` | Exact service connection name, **not** the Azure subscription ID |
| `acrName` | ACR resource name without `.azurecr.io` |
| `aksResourceGroup` | Resource group containing the assigned AKS cluster |
| `aksClusterName` | Assigned AKS cluster name |
| `participantName` | Unique lowercase letters and numbers, for example `student01` |
| `aksNamespace` | Existing authorized namespace; defaults to `default` |

With `student01`, generated names are `workshop-student01`, `nginx-student01`, and `app-student01`. Do not copy another participant's identifier. Keep credentials out of GitHub, logs, and chat.

- [ ] All five placeholders are replaced in the pipeline's source branch.
- [ ] My namespace already exists; these pipelines do not create it.
- [ ] My selected pipeline is authorized to use the service connection.
- [ ] The facilitator has confirmed ACR/AKS permissions, pull access, and network reachability.

**Sequencing rule:** app and Nginx builds share a repository and overwrite `latest`. Run one pipeline at a time per participant. The combined pipelines deploy their own numeric build-ID tags; deploy-only Nginx uses `latest` and needs a fresh Nginx build immediately beforehand.

## Demo 3: Build And Deploy Nginx

<details>
<summary>Turn website content into an image and deploy that run's image</summary>

**Pipeline:** [pipelines/acr-to-aks-nginx.yml](pipelines/acr-to-aks-nginx.yml). Wizard path: `/pipelines/acr-to-aks-nginx.yml`.

**Why:** connect a reproducible image build to a Kubernetes deployment without a separate manual handoff.

1. Run the pipeline after the Azure checkpoint. In Build logs, locate the ACR build and record the numeric image tag.
2. In Azure portal, open your ACR's **Repositories**, then `workshop-<your-participant-name>`. Look for the numeric tag and `latest` if you have registry read permission.
3. Inspect Deploy logs for the image reference, namespace, and successful rollout. Confirm the overall pipeline succeeded.
4. In the AKS workload view, check your `nginx-<participantName>` deployment has one ready replica and uses the same numeric image tag. Ask the facilitator for help if portal access is restricted.

- [ ] ACR built the image successfully.
- [ ] The deployed image tag matches this run, not merely `latest`.
- [ ] My Nginx deployment has one ready replica.

**Try it:** change the visible heading in [docker/nginx/index.html](docker/nginx/index.html), commit, and manually rerun. Verify the new tag and updated page using the optional browser check below.

**Discuss:** why is a build-specific image tag easier to trace than `latest`? Readiness is useful evidence, but the overall run must also finish successfully.

</details>

## Demo 4: Complete Application Delivery

<details>
<summary>Run real tests, build the Node.js image, and deploy the application</summary>

**Pipeline:** [pipelines/full-workshop.yml](pipelines/full-workshop.yml). Wizard path: `/pipelines/full-workshop.yml`.

**Why:** combine CI and deployment: Test → Build → Deploy. A failed Test stage prevents the later stages from executing.

1. Confirm the successful test edit from Demo 2 is restored in this pipeline's branch, then run the pipeline.
2. Inspect Test logs for the actual passing test, then Build logs for the versioned app image.
3. Inspect Deploy logs for a successful rollout of `app-<participantName>`. Verify its image uses this run's numeric tag.
4. Confirm the overall run succeeded and your application deployment has one ready replica. Its readiness probe calls `/health` on port `8080`.

- [ ] Test, Build, Deploy, and the overall run succeeded.
- [ ] The application image can be traced to this run.
- [ ] The app is ready; with browser access below, `/health` returns `{"status":"ok"}`.

**Discuss:** where would a failing unit test, a Docker build error, and an image-pull failure appear? The current starter has one small unit test, not comprehensive application coverage or production release controls.

</details>

## View Your Deployment

<details>
<summary>Optional browser check with an authorized local Kubernetes context</summary>

Services are internal **ClusterIP** services, not public website URLs. This optional check requires local `kubectl` and an authenticated kubeconfig for the assigned cluster. Ask the facilitator to establish that context securely; do not paste kubeconfig credentials into chat.

First inspect `kubectl config current-context` and confirm it names the intended workshop cluster. Replace `YOUR_NAMESPACE` and `YOUR_PARTICIPANT` below with your values. Use your assigned kubeconfig explicitly if you have multiple clusters configured.

```sh
kubectl get deployment nginx-YOUR_PARTICIPANT app-YOUR_PARTICIPANT --namespace YOUR_NAMESPACE
kubectl port-forward service/nginx-YOUR_PARTICIPANT 8081:80 --namespace YOUR_NAMESPACE
```

The first command assumes both deployment demos are complete; otherwise query only the deployment you created. While port-forward runs, open `http://localhost:8081` and check the workshop page or your edited heading. Stop port-forward with Ctrl+C.

For the Node app:

```sh
kubectl port-forward service/app-YOUR_PARTICIPANT 8082:80 --namespace YOUR_NAMESPACE
```

Open `http://localhost:8082/health`; expect HTTP 200 and `{"status":"ok"}`. Stop with Ctrl+C. These commands do not make the service public. If a local port is occupied, choose a different local port.

</details>

## Optional Labs

These isolate concepts for deeper discussion. They are not prerequisites for the combined pipelines and do not need to be run for every release.

<details>
<summary>Lab A: Import an existing image into ACR</summary>

**Pipeline:** [pipelines/acr-import-nginx.yml](pipelines/acr-import-nginx.yml). Wizard path: `/pipelines/acr-import-nginx.yml`.

Run after Azure setup. Inspect logs and your ACR repository for the imported numeric tag and `latest`. This copies a public MCR Nginx image without using your Dockerfile. No Kubernetes deployment occurs.

- [ ] I can explain importing an existing image versus building my own.

The imported base image does not include this workshop's website. It also overwrites `latest`; do not treat it as the input for the workshop deploy-only exercise. Continue with Lab B first.

</details>

<details>
<summary>Labs B and C: Separate image build from deployment</summary>

**Build:** [pipelines/acr-build-nginx.yml](pipelines/acr-build-nginx.yml). Wizard path: `/pipelines/acr-build-nginx.yml`.

**Deploy:** [pipelines/aks-deploy-nginx.yml](pipelines/aks-deploy-nginx.yml). Wizard path: `/pipelines/aks-deploy-nginx.yml`.

1. Run build-only and verify it produces the workshop Nginx image in ACR.
2. Immediately run deploy-only with no app build or import between the two. It deploys the existing `latest` tag and restarts the rollout; it does not build anything.
3. Check the deployment's ready replica and open the website using port-forward if available.

- [ ] I observed a successful build without a deployment.
- [ ] I deployed an existing image without rebuilding it.

**Discuss:** the deployment overlaps with Demo 3 intentionally. Separate stages are useful for troubleshooting and independent releases, but a production deploy-only flow should select a known image version or digest rather than mutable `latest`.

</details>

<details>
<summary>Lab D: Build and deploy the app without a separate test stage</summary>

**Pipeline:** [pipelines/acr-to-aks-app.yml](pipelines/acr-to-aks-app.yml). Wizard path: `/pipelines/acr-to-aks-app.yml`.

Run after Azure setup and compare its Build → Deploy stages with Demo 4's Test → Build → Deploy flow. Verify the app rollout and `/health`. It updates the same participant app deployment; it is not a second independent application.

- [ ] I can identify the missing CI gate and explain why the full-workshop pipeline is the preferred complete app demonstration.

</details>

## When A Run Does Not Pass

Open the first failing task and record its error, run URL, branch/commit, stage, and participant name. Diagnose before rerunning. Never share tokens, passwords, or kubeconfig contents.

| Symptom | First check |
| --- | --- |
| Queued; waiting for an agent | Organization's Microsoft-hosted parallel-job usage, entitlement, pool authorization, and service availability. More pipeline definitions do not add capacity. |
| Checkout denied or wrong files | GitHub app/repository authorization, selected repository, branch, and root layout. |
| Validation says `REPLACE_WITH_*` | Edit and commit the shared variables in the source branch actually used by this run. |
| Service connection missing or unauthorized | Exact connection name, correct Azure DevOps project, and authorization for this pipeline. |
| ACR build/import denied or queued | Correct registry and identity permissions for that operation; network restrictions and ACR build capacity. |
| AKS access forbidden or namespace missing | Assigned cluster/context, existing namespace, Azure credential access, and Kubernetes permissions. Ask the facilitator; do not grant yourself broad access. |
| `ImagePullBackOff` | Exact image/tag exists, AKS pull identity access to ACR, and network reachability. |
| Readiness or rollout timeout | Pod events/logs, expected port/health path, and node capacity. For deploy-only Nginx, rebuild Nginx first so `latest` is not the app or imported base. |
| A task is green but run still active | Wait for overall completion; post-job steps or organization-injected scans may still be running. |

<details>
<summary>Optional Copilot investigation prompts</summary>

Start with explanation or read-only diagnosis. Connected investigation requires configured, authenticated Azure DevOps/Azure tools with access to your assigned resources. Without tools, share sanitized logs. Never assume a proposed repair has been applied.

> Explain this pipeline's stages and variables. Identify which steps change Azure resources. Do not edit files or run the pipeline.

> Investigate this run URL in my assigned organization and project. Read logs, identify the first causal failure, and distinguish verified facts from hypotheses. Do not rerun, change permissions, or deploy anything.

> Compare the failed task with the YAML in this repository. Suggest the smallest fix and how to verify it. Ask before publishing changes or running a deployment.

</details>

## Finish The Workshop

- [ ] Record the run URLs, deployed image tags, and namespaces for the demos you completed.
- [ ] Explain the difference between a source repository, pipeline artifact, container registry, and running deployment.
- [ ] Explain why a green simulation is not the same as passing real tests or serving a healthy application.
- [ ] Stop local port-forward sessions. Deployments and Azure resources remain running after pipelines finish.
- [ ] Ask the facilitator about cleanup and billing. Do not delete shared AKS, ACR, namespaces, or other participants' workloads. The facilitator should review paid parallel-job capacity after the workshop.

## Repository Map

| Folder | Purpose |
| --- | --- |
| [app](app) | Node.js application and unit test |
| [docker](docker) | Dockerfiles and Nginx website; MCR base images |
| [pipelines](pipelines) | Eight entry points, shared variables, and validation template |
| [k8s](k8s) | Static manifest examples for discussion, not the pipeline deployment inputs |

AKS pipelines generate manifests inline from the shared variables. Edit those pipeline definitions when changing deployment behavior; editing the static `k8s/` examples alone will not change a pipeline run.
