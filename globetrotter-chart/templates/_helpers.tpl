{{- define "globetrotter.name" -}}
{{- .Chart.Name -}}
{{- end }}

{{- define "globetrotter.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "globetrotter.labels" -}}
app.kubernetes.io/name: {{ include "globetrotter.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "globetrotter.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
  {{ default (include "globetrotter.fullname" .) .Values.serviceAccount.name }}
{{- else }}
  default
{{- end }}
{{- end }}
