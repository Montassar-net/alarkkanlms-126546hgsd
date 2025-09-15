using Microsoft.AspNetCore.StaticFiles;

public class ExcludeHtmlContentTypeProvider : FileExtensionContentTypeProvider
{
    public ExcludeHtmlContentTypeProvider()
    {
        // Remove the default mapping for .html files
        Mappings.Remove(".html");
    }
}