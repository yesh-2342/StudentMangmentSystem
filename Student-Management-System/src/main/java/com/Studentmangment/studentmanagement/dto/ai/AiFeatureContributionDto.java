package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiFeatureContributionDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("feature")
    private String feature;

    @JsonProperty("display_name")
    @JsonAlias("displayName")
    private String displayName;

    @JsonProperty("value")
    private Double value;

    @JsonProperty("contribution")
    private Double contribution;

    @JsonProperty("impact_level")
    @JsonAlias("impactLevel")
    private String impactLevel; // "POSITIVE", "NEGATIVE", "NEUTRAL"

    @JsonProperty("insight")
    private String insight;

    public AiFeatureContributionDto() {}

    public AiFeatureContributionDto(String feature, String displayName, Double value, Double contribution, String impactLevel, String insight) {
        this.feature = feature;
        this.displayName = displayName;
        this.value = value;
        this.contribution = contribution;
        this.impactLevel = impactLevel;
        this.insight = insight;
    }

    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public Double getContribution() { return contribution; }
    public void setContribution(Double contribution) { this.contribution = contribution; }

    public String getImpactLevel() { return impactLevel; }
    public void setImpactLevel(String impactLevel) { this.impactLevel = impactLevel; }

    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
}
