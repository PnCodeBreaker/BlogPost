FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImageTransform
)
FilePond.setOptions({
    imageResizeTargetHeight: 720,
    imageResizeUpscale: false,
    allowImageTransform: true,
})
FilePond.parse(document.body);